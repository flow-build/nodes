const identifyTarget = (blueprint_spec: any) => {
  try {
    const { nodes } = blueprint_spec;
    const startNode = nodes.find(
      (node: any) => node.type.toLowerCase() === 'start',
    );
    const { parameters } = startNode;
    if (parameters && parameters.target) {
      return [true, parameters.target];
    }
    return [false];
  } catch (e) {
    console.log('Error: ', e);
    return [false];
  }
};

export { identifyTarget };
