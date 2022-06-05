const {TOCPattern, descriptionPattern} = require('./docPattern');
const {methodPattern, methodIndexRequirePattern, methodIndexExportsPattern} = require('./method');
const {methodSchemaPattern} = require('./methodShema');
const {unitPattern, unitIndexRequirePattern, unitIndexExportsPattern} = require('./unit')

module.exports = {
    TOCPattern,
    descriptionPattern,
    methodPattern,
    methodIndexRequirePattern,
    methodIndexExportsPattern,
    methodSchemaPattern,
    unitPattern,
    unitIndexRequirePattern,
    unitIndexExportsPattern,
}
