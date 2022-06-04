function toPascalCase (string) {
    return string
        .toLowerCase()
        .split(' ')
        .map(word => word
            .charAt(0)
            .toUpperCase() + word.slice(1)
        )
        .join('')
}

function toCamelCase (string) {
    const result =
        string
            .toLowerCase()
            .split(' ')
            .map(word => word
                .charAt(0)
                .toUpperCase() + word.slice(1)
            )
            .join('')

    return result
        .charAt(0)
        .toLowerCase() + result.slice(1)
}

function toKebabCase (string) {
    return string
        .toLowerCase()
        .split(' ')
        .join('-')
}

function toFlatCase (string) {
    return string
        .toLowerCase()
        .split(' ')
        .join('')
}

module.exports = {
    toPascalCase,
    toCamelCase,
    toKebabCase,
    toFlatCase,
}
