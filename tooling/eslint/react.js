import pluginReact from 'eslint-plugin-react';
import hooksPlugin from 'eslint-plugin-react-hooks';

export default [pluginReact.configs.flat.recommended];

export const plugins = {
  'react-hooks': hooksPlugin,
};

export const pluginsExtends = ['react-hooks/recommended'];
