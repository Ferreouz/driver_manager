import fs from "fs"
import { google, drive_v3 } from "googleapis"
import path from "path"
import { ext2mime, FolderOrFile, isFolderOrFile } from "./fileutils";
import { Credentials } from "./types";
import { checkAuthentication } from "./decorator";

export default class Drive {

  private drive: drive_v3.Drive;
  constructor(
    private rootFolder: string,
    private credentialsPath?: string,
    private credentials?: Credentials,
  ) {
    if (!credentialsPath && !credentials) {
      throw new Error("Need a credentials PATH or in JSON form");
    }
  }

  private async auth(): Promise<void> {
    const auth = new google.auth.GoogleAuth({
      credentials: this.credentials,
      keyFile: this.credentialsPath,
      scopes: ['https://www.googleapis.com/auth/drive'],
    });
    const client = await auth.getClient();
    const tokens = await client.getAccessToken();
    if (!tokens.token) {
      throw new Error("Authorization could not be verified, check your credentials");
    }

    this.drive = google.drive({ version: 'v3', auth });
  }

  @checkAuthentication()
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

  @checkAuthentication()
  async mv(itemId: string, newParentId: string): Promise<boolean> {
    try {
      // Get the existing parents of the folder
      const res = await this.drive.files.get({
        fileId: itemId,
        fields: 'parents',
      });
      const previousParents = res.data?.parents?.join(',');

      // Remove the folder from its previous parents
      await this.drive.files.update({
        fileId: itemId,
        addParents: newParentId,
        removeParents: previousParents,
        fields: 'id, parents',
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  @checkAuthentication()
  public async getChildren(folderId = this.rootFolder): Promise<FolderOrFile[]> {
    const filesFolders: FolderOrFile[] = [];

    try {
      const response = await this.drive.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        fields: 'files(id, name, mimeType, parents)',
      });

      const files = response?.data?.files || [];

      if (files.length > 0) {
        files.forEach((file, index) => {
          filesFolders.push({
            type: file.mimeType.includes('folder') ? 'folder' : 'file',
            name: file.name,
            id: file.id,
            parentId: file.parents.pop()
          })
        });
      }
      return filesFolders.sort((a, b) => a.name > b.name ? 1 : -1);

    } catch (error) {
      throw error;
    } 
  }

  @checkAuthentication()
  public async getFolderId(folderName: string, parentId = this.rootFolder): Promise<FolderOrFile[] | undefined> {

    const list = await this.getChildren(parentId);
    const out: FolderOrFile[] | undefined = list.filter(fileFolder => fileFolder.name == folderName) || undefined;
    return out;
  }

  @checkAuthentication()
  public async mkdir(folderName: string, parentFolderId = this.rootFolder): Promise<string | undefined> {

    const list = await this.getFolderId(folderName, parentFolderId);
    if (list && list.length > 0) {
      return list[0].id;
    }

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