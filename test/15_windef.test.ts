/// <reference types="node" />
/// <reference types="mocha" />

import {basename, normalize} from 'path';
import * as assert from 'power-assert';
import * as Conf from '../src/lib/conf';
import * as GT from '../src/lib/types';
import * as H from '../src/lib/helper';
import * as W from '../src/lib/windef';

const filename = basename(__filename);

describe(filename, () => {
    const types64_32 = new Set([
        'PVOID', 'HANDLE', 'HACCEL', 'HBITMAP',
        'HBRUSH', 'HCOLORSPACE', 'HCONV', 'HCONVLIST',
        'HCURSOR', 'HDC', 'HDDEDATA', 'HDESK',
        'HDROP', 'HDWP', 'HENHMETAFILE', 'HFILE',
        'HFONT', 'HGDIOBJ', 'HGLOBAL', 'HHOOK',
        'HICON', 'HINSTANCE', 'HKEY', 'HKL',
        'HLOCAL', 'HMENU', 'HMETAFILE', 'HMODULE',
        'HMONITOR', 'HPALETTE', 'HPEN', 'HRGN',
        'HRSRC', 'HSZ', 'HWINEVENTHOOK', 'HWINSTA',
        'HWND', 'LPHANDLE', 'SC_HANDLE', 'SERVICE_STATUS_HANDLE',
        'ULONG_PTR', 'DWORD_PTR', 'PDWORD_PTR', 'PSIZE_T', 'SIZE_T',
        'POINTER_32', 'POINTER_64', 'PHKEY',
    ]);
    const typesHalf = new Set([
        'HALF_PTR', 'UHALF_PTR',
    ]);

    test_arch(types64_32);
    test_arch_half(typesHalf);
});

function test_arch(types64_32: Set<string>) {
    const st = {
        _UNICODE: true,
        _WIN64: false,
    };

    for (let k of Object.keys(st)) {
        if (st[k]) {
            _test_arch(types64_32, {...st, [k]: ! st[k]});
        }
    }
    for (let k of Object.keys(st)) {
        if ( ! st[k]) {
            _test_arch(types64_32, {...st, [k]: ! st[k]});
        }
    }
}

function _test_arch(types64_32: Set<string>, settings: GT.LoadSettings) {
    for (let vv of types64_32) {
        // convert param like ['_WIN64_HOLDER_', 'int64', 'int32'] to 'int64' or 'int32'
        const param = H.parse_param_placeholder(<GT.FFIParamMacro> W[vv], settings);

        it(`Should ${vv}: value converted correctly under nodejs ${ settings._WIN64 ? 'x64' : 'ia32' }`, function() {
            if (settings._WIN64) {
                assert(param.indexOf('64') > 2 && param.indexOf('32') === -1, `${vv}: ${param} during x64`);   // must use param not W[vv]
            }
            else {
                assert(param.indexOf('32') > 2 && param.indexOf('64') === -1, `${vv}: ${param} during ia32`);
            }
        });
    }
}

function test_arch_half(values: Set<string>) {
    const st = {
        _UNICODE: true,
        _WIN64: false,
    };

    for (let k of Object.keys(st)) {
        if (st[k]) {
            _test_arch_half(values, {...st, [k]: ! st[k]});
        }
    }
    for (let k of Object.keys(st)) {
        if ( ! st[k]) {
            _test_arch_half(values, {...st, [k]: ! st[k]});
        }
    }
}

function _test_arch_half(typesHalf: Set<string>, settings: GT.LoadSettings) {
    for (let vv of typesHalf) {
        // convert param like ['_WIN64_HOLDER_', 'int64', 'int32'] to 'int64' or 'int32'
        const param = H.parse_param_placeholder(<GT.FFIParamMacro> W[vv], settings);

        it(`Should ${vv}: value converted correctly under nodejs ${ settings._WIN64 ? 'x64' : 'ia32' }`, function() {
            if (settings._WIN64) {
                const cond: boolean = param.indexOf('32') > 2 && param.indexOf('16') === -1 && param.indexOf('64') === -1;
                assert(cond, `${vv}: ${param} under x64`);   // must use param not W[vv]
            }
            else {
                const cond: boolean = param.indexOf('16') > 2 && param.indexOf('32') === -1 && param.indexOf('64') === -1;
                assert(cond, `${vv}: ${param} under ia32`);
            }
        });
    }
}

describe(filename, () => {
    const typesUnicode = new Set([
        'LPCTSTR', 'LPTSTR', 'PTBYTE', 'PTCHAR',
        'PTSTR', 'TBYTE', 'TCHAR',
    ]);

    unicode(true, typesUnicode);
    unicode(false, typesUnicode);
});

function unicode(_UNICODE: boolean, typesUnicode: Set<string>) {
    for (let vv of typesUnicode) {
        let param = W[vv];

        // convert param like ['_WIN64_HOLDER_', 'int64', 'int32'] to 'int64' or 'int32'
        if (param && Array.isArray(param)) {
            param = H.parse_placeholder_unicode(<GT.FnRetTypeMacro> param, <boolean> _UNICODE);
        }

        it(`Should macro ${vv}: value mathes setting of ANSI/UNICODE`, function() {
            if (_UNICODE) {
                const cond: boolean = param.indexOf('16') > 2 && param.indexOf('8') === -1;
                assert(cond, `${vv}: ${param} at UNICODE`);
            }
            else {
                // PTSTR == 'char*' under ia32
                const cond: boolean = (param.indexOf('8') > 2 || param === 'char*') && param.indexOf('16') === -1;
                assert(cond, `${vv}: ${param} at ANSI`);
            }
        });
    }
}