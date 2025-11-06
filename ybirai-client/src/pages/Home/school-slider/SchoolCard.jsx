import { motion } from "framer-motion"
import React from "react"

const SchoolCard = ({ school, index }) => {
    return (
        <motion.div
            className="rounded-3xl bg-primary-200 dark:bg-primary-200 h-80 w-56 md:h-[30rem] md:w-96 overflow-hidden flex flex-col items-start justify-start relative z-10 group"
        >
            <div className="absolute h-full w-full top-0 left-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />

            <div className="relative z-30 p-8 h-full flex flex-col justify-between">
                <div>
                    {/* <motion.p className="text-white text-sm md:text-base font-medium font-sans text-left">
                        {school.status}
                    </motion.p> */}
                    <motion.p className="text-white text-xl md:text-3xl font-semibold max-w-xs text-left [text-wrap:balance] font-sans mt-2">
                        {school.name}
                    </motion.p>
                </div>

                <div
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-y-auto max-h-[60%]">
                    <p className="text-white text-sm md:text-base mt-4 tracking-wide">
                        {school.description}
                    </p>
                </div>
            </div>

            <img
                src={school.logoUrl || `https://picsum.photos/seed/${school.id}/800/1200`}
                alt={school.name}
                className="object-cover absolute z-10 inset-0 w-full h-full"
            />
        </motion.div>
    )
}

export default SchoolCard