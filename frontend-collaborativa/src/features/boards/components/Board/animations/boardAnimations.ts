import { Variants } from "framer-motion";

export const containerVariants: Variants = {
  hidden: { 
    opacity: 0 
  },
  visible: { 
    opacity: 1, 
    transition: { 
      staggerChildren: 0.08, 
      delayChildren: 0.1,
      when: "beforeChildren" 
    } 
  },
};

export const chatVariants: Variants = {
  closed: { 
    x: "100%", 
    opacity: 0.8,
    scale: 0.98, // Efecto de alejamiento sutil al cerrar
    transition: { 
      type: "spring", 
      stiffness: 400, 
      damping: 40,
      restDelta: 0.5 
    } 
  },
  open: { 
    x: 0, 
    opacity: 1,
    scale: 1,
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 30, 
      mass: 0.8, 
    } 
  }
};

export const columnVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 30, 
    scale: 0.95 
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { 
      type: "spring", 
      stiffness: 100, 
      damping: 20, 
      mass: 1
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.2 }
  }
};

export const syncVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
};