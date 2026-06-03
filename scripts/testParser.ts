// debug file for parses
import "dotenv/config";
import {pareseNaturalLanguageQuery} from "../src/services/queryParserService";

async function run(){
    const result = await pareseNaturalLanguageQuery("modern grey sofa for living room");
    console.log(result);
}

run();