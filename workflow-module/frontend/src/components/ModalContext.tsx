"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { X } from "lucide-react";
import { NewDocumentModal } from "./modals/NewDocumentModal";
import { NewTemplateModal } from "./modals/NewTemplateModal";
import { NewWorkflowModal } from "./modals/NewWorkflowModal";

type ModalType = "NEW_DOCUMENT" | "NEW_TEMPLATE" | "NEW_WORKFLOW" | null;

interface ModalContextType {
  activeModal: ModalType;
  modalData: any;
  openModal: (type: ModalType, data?: any) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [modalData, setModalData] = useState<any>(null);

  const openModal = (type: ModalType, data?: any) => {
    setActiveModal(type);
    setModalData(data || null);
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalData(null);
  };

  return (
    <ModalContext.Provider value={{ activeModal, modalData, openModal, closeModal }}>
      {children}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-semibold text-slate-800">
                {activeModal === "NEW_DOCUMENT" && "New Document"}
                {activeModal === "NEW_TEMPLATE" && (modalData ? "Edit Template" : "New Template")}
                {activeModal === "NEW_WORKFLOW" && "New Workflow"}
              </h2>
              <button 
                onClick={closeModal}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Body Container */}
            <div className="p-6">
              {activeModal === "NEW_DOCUMENT" && <NewDocumentModal />}
              {activeModal === "NEW_TEMPLATE" && <NewTemplateModal />}
              {activeModal === "NEW_WORKFLOW" && <NewWorkflowModal />}
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}
