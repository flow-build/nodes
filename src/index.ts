import addSystemTaskCategory from '@flowbuild/engine';
import BasicAuthNode from './basicAuthNode';

const BasicAuthNodeWithTaskCategory = () => {
  addSystemTaskCategory({ basicAuth: BasicAuthNode });
};

export default BasicAuthNodeWithTaskCategory;
