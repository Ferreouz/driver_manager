import fs from "fs"
import { google, drive_v3 } from "googleapis"
import path from "path"
import { ext2mime, FolderOrFile } from "./fileutils";

export default class Drive {

  private drive: drive_v3.Drive;
  constructor(
    private serviceAccount: string,
    private rootFolder: string
  ) {
    this.auth();
  }

  private auth(): void {
    const auth = new google.auth.GoogleAuth({
      keyFile: this.serviceAccount,
      scopes: ['https://www.googleapis.com/auth/drive'],
    });
    // Initialize the Drive API
    this.drive = google.drive({ version: 'v3', auth });
  }

  public async upload(filePath: string, folderId: string): Promise<string | undefined> {
    const fileMetadata = {
      name: path.basename(filePath),
      parents: [folderId],
    };

    const media = {
      mimeType: ext2mime[path.extname(filePath)],
      body: fs.createReadStream(filePath),
    };

    try {
      const res = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id',
      });
      return res.data.id;
    } catch (error) {
      console.log(error)
    }
    return undefined;
  }


  public async getChildren(folderId = this.rootFolder): Promise<FolderOrFile[]> {
    const filesFolders: FolderOrFile[] = [];

    try {
      const response = await this.drive.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        fields: 'files(id, name, mimeType, parents)',
      });

      const files = response.data.files || [];

      if (files.length > 0) {
        files.forEach((file, index) => {
          filesFolders.push({
            type: file.mimeType.includes('folder') ? 'folder' : 'file',
            name: file.name,
            id: file.id,
            parentId: file.parents.pop()
          })
          // console.log(`[-] ${filesFolders[index].name} ${filesFolders[index].type} ${filesFolders[index].id}`);
        });
      }

    } catch (error) {
      console.error('Error listing files:', error);
    } finally {
      return filesFolders.sort((a, b) => a.name > b.name ? 1 : -1);
    }
  }

  public async getFolderId(folderName: string, parentId = this.rootFolder): Promise<FolderOrFile[] | undefined> {

    const list = await this.getChildren(parentId);
    const out: FolderOrFile[] | undefined = list.filter(fileFolder => fileFolder.name == folderName) || undefined;
    return out;
  }

  public async mkdir(folderName: string, parentFolderId = this.rootFolder): Promise<string | undefined> {

    const metadata: any = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentFolderId]
    };

    try {
      const response = await this.drive.files.create({
        requestBody: metadata,
        fields: 'id, name',
      });

      const folder = response.data;
      if (!folder || !folder.id) {
        return undefined;
      }

      return folder.id

    } catch (error) {
      return undefined;
    }

  }

}