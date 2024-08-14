import Drive from "../src/Drive";
import { Credentials } from "../src/types";
import { FolderOrFile } from "../src/fileutils";
import dotenv from 'dotenv'; 
dotenv.config();

jest.setTimeout(300000);
//https://drive.google.com/drive/u/1/folders/1aVlhBCNYD9hcXfKiyiw8vu02VorBGv8b
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

const drive = new Drive(rootFolder, undefined, JSON.parse(process.env.CREDENTIALS || "") as Credentials);

test("get all folders under root", async () => {
    expect(await drive?.getChildren(rootFolder)).toStrictEqual(resultRootChildrens);
})

test("upload file", async () => {
    fileId = await drive?.upload(filePath, parentFolder);
    expect(fileId).toBeDefined();
})

test("mkdir", async () => {
    folderId = await drive?.mkdir("mkdir-test", parentFolder);
    expect(folderId).toBeDefined();
})

test("check existence of file uploaded and dir created", async () => {
    await new Promise((r) => setTimeout(r, 15000));
    const childrens = await drive?.getChildren(parentFolder);
    expect(childrens?.some(child => child.id == fileId && child.name == "sample.txt" && child.type == "file" && child.parentId == parentFolder)).toEqual(true);
    expect(childrens?.some(child => child.id == folderId && child.name == "mkdir-test" && child.type == "folder" && child.parentId == parentFolder)).toEqual(true);
})

const parentMv = "1QCFXBWsOxY4RDtL8qc3zwhhBahHwff1c";
test("mv file to folder and folder to another folder", async () => {
    await drive?.mv(fileId || "", folderId || "");
    await drive?.mv(folderId || "", parentMv);
})

test("check moved folder parent and it's child", async () => {
    await new Promise((r) => setTimeout(r, 15000));
    const childrensMv = await drive?.getChildren(parentMv);
    expect(childrensMv?.some(child => child.parentId == parentMv && child.id == folderId)).toEqual(true);
    const childrens = await drive?.getChildren(folderId);
    expect(childrens?.some(child => child.parentId == folderId && child.id == fileId)).toEqual(true);
})
