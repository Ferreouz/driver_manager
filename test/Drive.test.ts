import Drive from "../src/Drive"
import { FolderOrFile } from "../src/fileutils"

jest.setTimeout(30000);

const rootFolder = "1aVlhBCNYD9hcXfKiyiw8vu02VorBGv8b";

const resultRootChildrens: FolderOrFile[] = [
    {
        name: "Folder1",
        id: "1YXzRbGg5g8XFs0y1ywRdK3JNtdILzeYr",
        type: "folder",
        parentId: rootFolder
    },
    {
        name: "Folder2",
        id: "1pLabcmsxtd4LRGPNw3O7lD7ebsSWdyZ7", 
        type: "folder",
        parentId: rootFolder
    },
    {
        name: "openings.jpeg",
        id: "1QHt0Wl1h4zJLft53S5cF_wFkMQ6WUeEv",
        type: "file",
        parentId: rootFolder
    },
    {
        name: "worldWritable",
        id: "1h8rO0BSVW5F2fiTtlecxa9X0YEdO4H44",
        type: "folder",
        parentId: rootFolder
    },
]
const filePath = "./test/sample/sample.txt";
const parentFolder = "1h8rO0BSVW5F2fiTtlecxa9X0YEdO4H44";

let fileId:string | undefined = undefined;
let folderId: string | undefined = undefined;

const drive = new Drive("./creds/test.json", rootFolder);

test("get all folders under root", async () => {
    expect(await drive.getChildren(rootFolder)).toStrictEqual(resultRootChildrens);
})

test("upload file", async () => {
    fileId = await drive.upload(filePath, parentFolder);
    expect(fileId).toBeDefined();
})

test("mkdir", async () => {
    folderId = await drive.mkdir("mkdir-test", parentFolder);
    expect(folderId).toBeDefined();
})

test("check existence of file uploaded and dir created", async () => {
    await new Promise((r) => setTimeout(r, 15000));
    const childrens = await drive.getChildren(parentFolder);
    expect(childrens.some(child => child.id == fileId && child.name == "sample.txt" && child.type == "file" && child.parentId == parentFolder)).toEqual(true);
    expect(childrens.some(child => child.id == folderId && child.name == "mkdir-test" && child.type == "folder" && child.parentId == parentFolder)).toEqual(true);
})
