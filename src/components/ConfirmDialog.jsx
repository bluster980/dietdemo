import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";

function ConfirmDialog({ isOpen, onClose, onConfirm }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed w-full h-full flex items-center justify-center bg-black bg-opacity-50"
                >
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0.8 }}
                        className="flex flex-col bg-white w-[72%] h-[90px] rounded-[8px] font-urbanist"
                    >
                        <p className="text-[14px] mt-[10px] ml-[10px] font-semibold text-[#2D3436]">Are you sure?</p>
                        <p className="text-[10px] ml-[10px] text-[#777474]">This action cannot be undone</p>
                        <div className="flex justify-end items-end h-[30px] gap-x-[4px] mr-[10px] mt-[3px] font-semibold">
                            <div className="flex items-center justify-center border border-[#d1d1d1] rounded-[5px] text-[#6C757D] h-[75%] w-[20%]">
                                <button className="text-[12px]" onClick={onClose}>Cancel</button>
                            </div>
                            <div className="flex items-center justify-center border border-[#FFC2BE] rounded-[5px] text-[#FF6F7A] h-[75%] w-[20%]">
                                <button className="text-[12px]" onClick={onConfirm}>Confirm</button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default ConfirmDialog;
