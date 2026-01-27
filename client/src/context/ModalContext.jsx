import { createContext, useContext, useState } from 'react'

const ModalContext = createContext()

export const ModalProvider = ({ children }) => {
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success', // 'success', 'error', 'confirm'
    onConfirm: null,
    onCancel: null
  })

  const showModal = ({ title, message, type = 'success', onConfirm = null, onCancel = null }) => {
    setModal({
      isOpen: true,
      title,
      message,
      type,
      onConfirm,
      onCancel
    })
  }

  const hideModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }))
  }

  return (
    <ModalContext.Provider value={{ showModal, hideModal, modal }}>
      {children}
    </ModalContext.Provider>
  )
}

export const useModal = () => useContext(ModalContext)
