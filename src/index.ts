import Drive from "./Drive";
import { Credentials } from "../src/types";
import dotenv from 'dotenv';
dotenv.config();

async function main() {
    const folder = "1WLVKA45obaJ2BC9H_PNjgHV2zNCdqs_U"; // process.env.ROOT_FOLDER
    const drive = new Drive(folder, undefined, JSON.parse(process.env.CREDENTIALS || "") as Credentials);
    //    await drive.mv("1PiAD7zcJi0fbNfQLOG7eAr7IZzXisS7W", "1wsb6c2e1AZwX_5Ms9Ss8--AYTN2WFvfm")
    // const parent = "1QCFXBWsOxY4RDtL8qc3zwhhBahHwff1c";
    // await drive.mv(folder, parent);
    // const childrens = await drive.getChildren(parentFolder);
    const all = await drive.getChildren()
    const all2 = await drive.getChildren()
    console.log(all)
}
main()