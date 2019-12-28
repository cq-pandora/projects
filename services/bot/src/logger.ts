import {
	createLogger, format, transports, Logger
} from 'winston';

const formatError = (error: Error): string => `\n${error.stack}`;
const formatPlainExtra = (extra: any): string => JSON.stringify(extra, null, 4);
const formatExtra = (extra: any): string => (extra instanceof Error ? formatError(extra) : formatPlainExtra(extra));

const loggingFormat = format.printf((info) => {
	const {
		timestamp, label, level, message, ...extra
	} = info;

	const splat = extra.splat || [];

	return `${timestamp} [${label}:${level}] ${message} ${splat.map((s: any) => formatExtra(s)).join('\n')}`;
});

function makeLogger(label: string): Logger {
	return createLogger({
		format: format.combine(
			format.colorize(),
			format.align(),
			format.label({ label }),
			format.timestamp(),
			loggingFormat,
		),
		transports: [new transports.Console()],
		level: 'debug',
	});
}

export default makeLogger('GENERAL');
export const db = makeLogger('DB');
export const commands = makeLogger('CMD');
