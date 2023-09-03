import { promises as fs } from 'fs';
import { join } from 'path';

export class FileUtility {
    static async appendToFile(filename: string, data: any) {
    const filePath = join(__dirname, '../../logs/', filename);
    
    const dataString = JSON.stringify(data) + '\n';
        try {
            await fs.access(filePath); // Check if file exists
            await fs.appendFile(filePath, dataString); // If it exists, append to it
        } catch (e) {
        if (e.code === 'ENOENT') {
            await fs.writeFile(filePath, dataString); // If it doesn't exist, create and write to it
        } else {
            throw e;
        }
        }
  }
}
