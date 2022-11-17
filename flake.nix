{
  description = "virtual environments";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs";
    flake-utils.url = "github:numtide/flake-utils";
    devshell = {
      url = "github:numtide/devshell";
      inputs = {
        nixpkgs.follows = "nixpkgs";
        flake-utils.follows = "flake-utils";
      };
    };
  };

  outputs = {
    self,
    flake-utils,
    devshell,
    nixpkgs,
  }:
    flake-utils.lib.eachDefaultSystem (system: {
      devShell = let
        pkgs = import nixpkgs {
          inherit system;

          overlays = [devshell.overlay];
        };

        pkgWithCategory = category: package: {inherit package category;};

        start_pg = pkgs.writeScript "start-pg" ''
          #!${pkgs.stdenv.shell}
          pg_pid=""
          set -euo pipefail
          export PGHOST=$PANDORA_DB_HOST
          export PGPORT=$PANDORA_DB_PORT
          export PGDATABASE=$PANDORA_DB_DATABASE
          # TODO: port
          pg_ctl -D "$HOME/.pgdata" -w start || (echo pg_ctl failed; exit 1)
          until psql postgres -c "SELECT 1" > /dev/null 2>&1 ; do
              echo waiting for pg
              sleep 0.5
          done
        '';

        init_pg = pkgs.writeScript "init-pg" ''
          #!${pkgs.stdenv.shell}
          pg_pid=""
          set -euo pipefail
          export PGHOST=$PANDORA_DB_HOST
          export PGPORT=$PANDORA_DB_PORT
          export PGDATABASE=$PANDORA_DB_DATABASE
          initdb -D $HOME/.pgdata
          echo "unix_socket_directories = '$(mktemp -d)'" >> $HOME/.pgdata/postgresql.conf
          # TODO: port
          pg_ctl -D "$HOME/.pgdata" -w start || (echo pg_ctl failed; exit 1)
          until psql postgres -c "SELECT 1" > /dev/null 2>&1 ; do
              echo waiting for pg
              sleep 0.5
          done
          psql postgres -w -c "CREATE DATABASE $PGDATABASE"
          psql postgres -w -c "CREATE ROLE $PANDORA_DB_USER WITH LOGIN PASSWORD '$PANDORA_DB_PASSWORD'"
          psql postgres -w -c "GRANT ALL PRIVILEGES ON DATABASE $PGDATABASE TO $PANDORA_DB_USER"
        '';

        stop_pg = pkgs.writeScript "stop-pg" ''
          #!${pkgs.stdenv.shell}
          pg_pid=""
          set -euo pipefail
          pg_ctl -D $HOME/.pgdata -w -m immediate stop
        '';
      in
        pkgs.devshell.mkShell {
          name = "cquest";

          commands = [
            {
              name = "pginit";
              help = "init psql service";
              category = "database";
              command = "${init_pg}";
            }
            {
              name = "pgstart";
              help = "start psql service";
              category = "database";
              command = "${start_pg}";
            }
            {
              name = "pgstop";
              help = "stop psql service";
              category = "database";
              command = "${stop_pg}";
            }
            {
              name = "migrate";
              help = "migrate database";
              category = "database";
              command = "yarn workspace @cquest/db migrate:up -d $PRJ_ROOT/shared/db/ormconfig.ts";
            }
            {
              name = "watch";
              help = "watch for code changes";
              category = "dev";
              command = "yarn watch";
            }
            {
              name = "clean";
              help = "clean compiled code";
              category = "dev";
              command = "yarn clean";
            }
            {
              name = "start-pandora";
              help = "start-pandora";
              category = "dev";
              command = "yarn workspace @cquest/pandora dev";
            }
          ];

          env = [
            {
              name = "PANDORA_PREFIX";
              value = "!";
            }

            {
              name = "PANDORA_URL_IMAGES_PREFIX";
              value = "https://data.fenrir.moe/";
            }

            {
              name = "PANDORA_IMAGES_SUFFIX";
              value = ".png";
            }

            {
              name = "PANDORA_DB_HOST";
              value = "localhost";
            }

            {
              name = "PANDORA_DB_PORT";
              value = "5432";
            }

            {
              name = "PANDORA_DB_DATABASE";
              value = "cquest";
            }

            {
              name = "PANDORA_DB_SCHEMA";
              value = "public";
            }

            {
              name = "PANDORA_DB_USER";
              value = "pandora";
            }

            {
              name = "PANDORA_DB_PASSWORD";
              value = "pandora";
            }
          ];

          packages = with pkgs; [nodejs-18_x yarn postgresql_12];
        };
    });
}
