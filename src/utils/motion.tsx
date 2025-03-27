import { motion, HTMLMotionProps } from 'framer-motion';
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  BoxProps,
  TypographyProps,
  TextFieldProps,
  ButtonProps,
  AvatarProps,
} from '@mui/material';

// Type intersections for props
export type MotionBoxProps = BoxProps & HTMLMotionProps<'div'>;
export type MotionTypographyProps = TypographyProps & HTMLMotionProps<'div'>;
export type MotionTextFieldProps = TextFieldProps & HTMLMotionProps<'div'>;
export type MotionButtonProps = ButtonProps & HTMLMotionProps<'button'>;
export type MotionAvatarProps = AvatarProps & HTMLMotionProps<'div'>;

// Create the components (not as const variables, but as function components)
export const MotionBox = motion(Box) as React.FC<MotionBoxProps>;
export const MotionTypography = motion(Typography) as React.FC<MotionTypographyProps>;
export const MotionTextField = motion(TextField) as React.FC<MotionTextFieldProps>;
export const MotionButton = motion(Button) as React.FC<MotionButtonProps>;
export const MotionAvatar = motion(Avatar) as React.FC<MotionAvatarProps>;

// Animation variants
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
      duration: 0.5
    }
  }
};

export const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

export const logoVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { 
      type: "spring",
      stiffness: 260,
      damping: 20,
      duration: 0.7 
    }
  }
};

export const buttonVariants = {
  hover: { 
    scale: 1.03,
    boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)",
    transition: { duration: 0.3 }
  },
  tap: { scale: 0.97 }
};