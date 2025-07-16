import { CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CButton } from "@coreui/react";

const ConfirmModal = ({ visible, onClose, onConfirm, title = "Confirmar", children, confirmText = "Eliminar", confirmColor = "danger" }) => (
  <CModal visible={visible} onClose={onClose}>
    <CModalHeader>
      <CModalTitle>{title}</CModalTitle>
    </CModalHeader>
    <CModalBody>
      {children}
    </CModalBody>
    <CModalFooter>
      <CButton color={confirmColor} onClick={onConfirm}>
        {confirmText}
      </CButton>
      <CButton color="secondary" variant="outline" onClick={onClose}>
        Cancelar
      </CButton>
    </CModalFooter>
  </CModal>
);

export default ConfirmModal;