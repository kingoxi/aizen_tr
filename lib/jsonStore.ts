import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// The data directory is located at the root of the project (outside /app)
const dataDir = path.join(process.cwd(), "..", "data");

export function readJSON<T>(filename: string): T {
    const filePath = path.join(dataDir, filename);
    if (!fs.existsSync(filePath)) {
        return [] as T;
    }
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
}

export function writeJSON<T>(filename: string, data: T): void {
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    const filePath = path.join(dataDir, filename);
    const tempPath = path.join(dataDir, `${filename}.${uuidv4()}.tmp`);

    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), "utf-8");
    fs.renameSync(tempPath, filePath);
}
