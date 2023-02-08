import TelegramApi from "node-telegram-bot-api";

import {GoogleSpreadsheet} from "google-spreadsheet";
import creds from "./client_secret.json" assert {type: "json"};

import pass from "./passwords.json" assert {type: "json"};
import {keyboardMainMenu, choiceElementButtons, backButton} from "./options.js";


const bot = new TelegramApi(pass.token, {polling: true})


let toggle = 0
let material = 0
let arr = []

const start = async () => {

    await bot.setMyCommands([
        {command: "/start", description: "Запуск бота"},
    ])


    bot.on("message", async (msg) => {
        console.log('1', msg.text)
        const chatId = msg.chat.id;
        const text = msg.text;

        if (text === "/start") {
            toggle = 0
            return bot.sendMessage(chatId, "Вітаю, оберіть якусь дію:", keyboardMainMenu)
        }
        if (text === "Назад") {
            toggle = 0
            await bot.sendMessage(chatId, "Обери наступну дію:", keyboardMainMenu)
        }
        if (text === "Переріз кабеля" || toggle === 1) {
            console.log('2', msg.text)
            if (toggle === 1) {
                console.log(toggle)
                let S = (0.785 * Math.pow(parseFloat(text), 2)).toFixed(2)
                await bot.sendMessage(chatId, `Результат: <b>${S}</b> мм^2\nВведіть діаметр(мм):`, {parse_mode: "HTML",})
            } else {
                await bot.sendMessage(chatId, "Введіть діаметр(мм):", backButton);
                toggle = 1
            }
        }
        if (text === "Вибір кабеля по потужності" || toggle === 2) {
            if (toggle === 2) {
                let data = await accessSpreadsheet();
                console.log(arr);
                //console.log(rows)
                for (let row = 0; row < data[0].length; row++) {
                    if (parseFloat(data[0][row]["Перетин струмопровідної жили мм^2"]) === getNumber(arr, parseFloat(text))) {
                        await bot.sendMessage(chatId, `🖋Результат до <b>${data[1]}</b> кабелю.\n✅<b>Для 220В:</b>\n👉Струм - ${data[0][row]['Напруга 220В']} A;\n👉Потужність - ${data[0][row]._rawData[2]} кВт.\n✅<b>Для 380В:</b>\n👉Струм - ${data[0][row]['Напруга 380В']} A;\n👉Потужність - ${data[0][row]._rawData[4]} кВт.`, {parse_mode: "HTML"});
                        arr = [];
                        break;
                    }
                }
                //await bot.sendMessage(chatId, "Введіть переріз кабелю в мм^2:");
            } else {
                await bot.sendMessage(chatId, "Виберіть матеріал кабелю:", choiceElementButtons);
            }
        }
    });
    bot.on("callback_query", function onCallbackQuery(callbackQuery) {
        //console.log(callbackQuery.message)
        toggle = 2
        if (callbackQuery.data === "Cu") {
            return bot.sendMessage(callbackQuery.message.chat.id, "Введіть переріз кабелю в мм^2:", backButton);
        } else if (callbackQuery.data === "Al") {
            material = 1
            return bot.sendMessage(callbackQuery.message.chat.id, "Введіть переріз кабелю в мм^2:", backButton);
        }
    });
}

await start()

function addDataToArr(row) {
    //console.log(data._sheet.headerValues)
    //console.log(data._rowNumber)
    // console.log(data._rawData)
    //console.log(data["Перетин струмопровідної жили мм^2"])
    //console.log(data["Напруга 220 В"])
    //console.log(data["Напруга 380 В"])
    //console.log('--------------------------------------------------')
    //console.log(row._sheet.headerValues);
    arr.push(parseFloat(row["Перетин струмопровідної жили мм^2"]))
}

const getNumber = (arr, searchNum) => {
    return arr.find(it => Math.abs(it - searchNum) === Math.min(...arr.map(it => Math.abs(it - searchNum))));
}

async function accessSpreadsheet() {
    const doc = new GoogleSpreadsheet(pass.sheet_url);
    await doc.useServiceAccountAuth({
        client_email: creds.client_email,
        private_key: creds.private_key,
    });

    await doc.loadInfo(); // loads document properties and worksheets


    const sheet = doc.sheetsByIndex[material]; // or use doc.sheetsById[id]
    //console.log(sheet);
    //console.log(sheet.rowIndex);
    const rows = await sheet.getRows({
        offset: 1
    });

    rows.forEach(row => {
        addDataToArr(row);
    })

    return [rows, sheet.title];
}

