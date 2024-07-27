import Drive from "./Drive"
import dotenv from "dotenv"
dotenv.config()

async function main() {
    const drive = new Drive(process.env.SERVICE_ACCOUNT_PATH, process.env.ROOT_FOLDER);
}

main()