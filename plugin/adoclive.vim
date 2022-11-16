if exists('g:loaded_adoclive') && g:loaded_adoclive
    finish
endif
let g:loaded_adoclive = v:true

command! Adoclive call adoclive#start()
command! AdocliveClose call adoclive#close()
