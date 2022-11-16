function! s:notify(method) abort
    call denops#plugin#wait_async('adoclive', {->denops#notify('adoclive', a:method, [])})
endfunction

function! adoclive#start() abort
    call s:notify('start')
endfunction

function! adoclive#close() abort
    call s:notify('close')
endfunction

function! adoclive#status() abort
    return denops#request('adoclive', 'status', [])
endfunction

function! adoclive#addr() abort
    return denops#request('adoclive', 'addr', [])
endfunction
