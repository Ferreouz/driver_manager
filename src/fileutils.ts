export type FolderOrFile = {
    type: 'file' | 'folder',
    id: string,
    name: string,
    parentId?: string
}
export function isFolderOrFile(obj: any): obj is FolderOrFile {
    return 'type' in obj && 'id' in obj && 'name' in obj;
}
export const ext2mime = {
    '.txt': 'text/plain',
    '.html': 'text/html',
    '.json': 'application/json',
    '.js': 'application/javascript',
    '.mjs': 'application/javascript',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}

