function! s:notify(method) abort
    call denops#plugin#wait_async('adoclive', {->denops#notify('adoclive', a:method, [])})
endfunction

function! s:request(method) abort
    call denops#plugin#wait('adoclive', {->denops#request('adoclive', a:method, [])})
endfunction

function! adoclive#start() abort
    call s:notify('start')
endfunction

function! adoclive#close() abort
    call s:notify('close')
endfunction

function! adoclive#status() abort
    return s:request('status')
endfunction

function! adoclive#addr() abort
    return s:request('addr')
endfunction
