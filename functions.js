exports.phoneNumberValidator = (text) => {
    const regexp = /[0-9]/g;

    if (
        (text.length == 9 && text.match(regexp).length == 9) ||
        (text.length == 12 && text.match(regexp).length == 12) ||
        (text.length == 13 && text.match(regexp).length == 12 && text[0] == "+")
    ) {
        return true;
    } else {
        return false;
    }
};
