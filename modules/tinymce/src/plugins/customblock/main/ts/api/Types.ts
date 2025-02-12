export interface CustomBlockData {
  bgColor?: string;
  width?: string;
  height?: string;
  margin?: string;
  padding?: string;
  border?: string;
  boxShadow?: string;
  display?: string;
  link?: string;
}

export interface CustomBlockApi {
  applyStyles: (styles: CustomBlockData) => void;
}

export interface CustomBlockOptions {
  // 可以添加插件配置选项
}