import * as fs from "fs";

export namespace Secrets {
    export const read = (name: string): string | undefined => {
        const path = `/run/secrets/${name}`;
        try {
            if (!fs.existsSync(path)) {
                console.debug(`${name} is not a Docker secret, switching to environment variable`);
                return process.env[name];
            }

            return fs.readFileSync(path, 'utf-8').trim();
        } catch (e) {
            console.error(`Failed to interact with file system to read Docker secret ${name}:`, e);
            return process.env[name];
        }
    }
}
