import { isCommaExist, isNotEmpty, prepareValue } from "../src/helper";

describe('Unit Test', () => {
    it('helper.isCommaExist', () => {
        let result: boolean = isCommaExist('genes ,  oke   sip');
        expect(result).toBe(true);
        result = isCommaExist('genesoke   sip');
        expect(result).toBe(false);
        result = isCommaExist('gene,s  oke   sip');
        expect(result).toBe(true);
        result = isCommaExist(',,,,');
        expect(result).toBe(true);
        result = isCommaExist('genes oke sip ya');
        expect(result).toBe(false);
    });

    it('helper.isNotEmpty', () => {
        const name = '      ';
        let result: boolean = isNotEmpty(name.trim());
        expect(result).toBeFalsy();
    });

    it('helper.prepareValue', () => {
        const value = 'genes';
        expect(prepareValue(value)).toBe("'genes'");
    })
})