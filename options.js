
export const keyboardMainMenu = {
    reply_markup: JSON.stringify({
        keyboard: [["Переріз кабеля", "Вибір кабеля по потужності"]],
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
        "keyboard": [["Назад"]],
        "resize_keyboard": true
    },
}