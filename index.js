import TelegramApi from "node-telegram-bot-api";

import {GoogleSpreadsheet} from "google-spreadsheet";
import creds from "./client_secret.json" assert {type: "json"};

import pass from "./passwords.json" assert {type: "json"};
import {keyboardMainMenu, choiceElementButtons, backButton, choiceConvertButtons, choiceVoltageButtons} from "./options.js";


const bot = new TelegramApi(pass.token, {polling: true})


let toggle = 0
let material = 0
let arr = []
let choiceConvert = 0
let U = 0

const parse_mode = {parse_mode: "HTML"}

const start = async () => {

    await bot.setMyCommands([
        {command: "/start", description: "Запуск бота"},
    ])


    bot.on("message", async (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text;

        if (text === "/start") {
            toggle = 0
            return bot.sendMessage(chatId, "Вітаю👋, оберіть якусь дію:", keyboardMainMenu)
        }
        if (text === "Назад👈") {
            toggle = 0
            await bot.sendMessage(chatId, "Обери наступну дію:", keyboardMainMenu)
        }
        if (text === "Переріз кабеля ➰" || toggle === 1) {
            if (toggle === 1) {
                let S = (0.785 * Math.pow(parseFloat(text), 2)).toFixed(2)
                await bot.sendMessage(chatId, `Результат: <b>${S}</b> мм^2`, parse_mode)
            } else {
                await bot.sendMessage(chatId, "Введіть діаметр(мм):", backButton);
                toggle = 1
            }
        }
        if (text === "Вибір кабеля по потужності ⚡" || toggle === 2) {
            if (toggle === 2) {
                let data = await accessSpreadsheet();
                for (let row = 0; row < data[0].length; row++) {
                    if (parseFloat(data[0][row]["Перетин струмопровідної жили мм^2"]) === getNumber(arr, parseFloat(text))) {
                        await bot.sendMessage(chatId, `🖋Результат до <b>${data[1]}</b> кабелю.\n✅<b>Для 220В:</b>\n👉Струм - ${data[0][row]['Напруга 220В']} A;\n👉Потужність - ${data[0][row]._rawData[2]} кВт.\n✅<b>Для 380В:</b>\n👉Струм - ${data[0][row]['Напруга 380В']} A;\n👉Потужність - ${data[0][row]._rawData[4]} кВт.`, parse_mode);
                        arr = [];
                        break;
                    }
                }
            } else {
                await bot.sendMessage(chatId, "Виберіть матеріал кабелю:", choiceElementButtons);
            }
        }
        if (text === "Калькулятор 🧮" || toggle === 3) {
            if (toggle === 3) {
                if (choiceConvert === 1) {
                    const A = ((parseFloat(text) * 1000) / U).toFixed(3)
                    await bot.sendMessage(chatId, `🟢Результат переводу: <b>${A}</b> A`, parse_mode)
                }
                else if (choiceConvert === 2) {
                    const W = ((parseFloat(text) * U) / 1000).toFixed(3)
                    await bot.sendMessage(chatId, `🟢Результат переводу: <b>${W}</b> кВт`, parse_mode)
                }
            } else {
                await bot.sendMessage(chatId, "Виберіть варіант переводу:", choiceConvertButtons)
            }
        }
    });
    bot.on("callback_query", function onCallbackQuery(callbackQuery) {
        if (callbackQuery.data === "Cu") {
            toggle = 2
            return bot.sendMessage(callbackQuery.message.chat.id, "Введіть переріз кабелю в мм^2:", backButton);
        } else if (callbackQuery.data === "Al") {
            toggle = 2
            material = 1
            return bot.sendMessage(callbackQuery.message.chat.id, "Введіть переріз кабелю в мм^2:", backButton);
        }
        else if (callbackQuery.data === "kW to A") {
            choiceConvert = 1
            return bot.sendMessage(callbackQuery.message.chat.id, "Виберіть напругу струму(В):", choiceVoltageButtons);
        }
        else if (callbackQuery.data === "A to kW") {
            choiceConvert = 2
            return bot.sendMessage(callbackQuery.message.chat.id, "Виберіть напругу струму(В):", choiceVoltageButtons);
        }
        else if (callbackQuery.data === "230") {
            toggle = 3
            U = parseInt(callbackQuery.data)
            if (choiceConvert === 1) {
                return bot.sendMessage(callbackQuery.message.chat.id, "Введіть значення кВт:", backButton);
            }
            else if (choiceConvert === 2) {
                return bot.sendMessage(callbackQuery.message.chat.id, "Введіть значення A:", backButton);
            }
        }
        else if (callbackQuery.data === "400") {
            toggle = 3
            U = parseInt(callbackQuery.data)
        }
    });
}

await start()

function addDataToArr(row) {
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

    const sheet = doc.sheetsByIndex[material];
    const rows = await sheet.getRows({
        offset: 1
    });

    rows.forEach(row => {
        addDataToArr(row);
    })

    return [rows, sheet.title];
}

