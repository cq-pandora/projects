export default (key: string, prefix: string, def = ''): string => process.env[prefix + key] || def;
