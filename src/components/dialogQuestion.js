import React, { useState } from 'react'
import Dialog from "react-native-dialog";

const useConfirm = () => {
  const [ open, setOpen ] = useState(false);
  const [ resolver, setResolver ] = useState({ resolver: null })
  const [ label, setLabel ] = useState('')

  const createPromise = () => {
    let resolver;
    return [ new Promise(( resolve, reject ) => {

        resolver = resolve
    }), resolver]
  }
  
  const getConfirmation = async (text) => {
        setLabel(text);
        setOpen(true);
        const [ promise, resolve ] = await createPromise()
        setResolver({ resolve })
        return promise;
  }

  const onClick = async(status) => {
        setOpen(false);
        resolver.resolve(status)
  }

  const Confirmation = () => (
      <Dialog.Container open={open}>
        <Dialog.Title>Load File</Dialog.Title>
            <Dialog.Description>
                Do you want to overwrite current Events? You cannot undo this action.
            </Dialog.Description>
        <Dialog.Button label="Yes" onPress={() => onClick(true)} />
        <Dialog.Button label="No" onPress={() => onClick(false)} />
    </Dialog.Container>
  )

    return [ getConfirmation, Confirmation ]
    
}

export {useConfirm};