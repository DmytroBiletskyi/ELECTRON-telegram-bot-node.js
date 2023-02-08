
export const keyboardMainMenu = {
    reply_markup: JSON.stringify({
        keyboard: [["Переріз кабеля ➰", "Вибір кабеля по потужності ⚡"],
        ["Калькулятор 🧮", "Вибір автомата ⚙"]],
        resize_keyboard: true,
        one_time_keyboard: true
    })
};


export const choiceElementButtons = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text: 'Мідний', callback_data: 'Cu'}, {text: 'Алюмінієвий', callback_data: 'Al'}],
        ]
    })
};

export const backButton = {
    "reply_markup": {
        "keyboard": [["Назад👈"]],
        "resize_keyboard": true,
        "one_time_keyboard": true
    },
};

export const choiceConvertButtons = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text: 'кВт ➡ А', callback_data: 'kW to A'}, {text: 'А ➡ кВт', callback_data: 'A to kW'}],
        ]
    })
};

export const choiceVoltageButtons = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text: '230В', callback_data: '230'}, {text: '400В', callback_data: '400'}],
        ]
    })
}