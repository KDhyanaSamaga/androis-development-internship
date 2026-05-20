import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export const rWidth = wp;
export const rHeight = hp;

// Helper to calculate responsive font size based on width
export const rFont = (size) => {
  const standardWidth = 375; // iPhone 11/X width as baseline
  const percent = (size / standardWidth) * 100;
  return wp(percent);
};
