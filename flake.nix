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
      in
        pkgs.devshell.mkShell {
          imports = [
            # (pkgs.devshell.importTOML ./devshell.toml)
          ];
          devshell.packages = with pkgs; [nodejs-18_x yarn];
        };
    });
}
