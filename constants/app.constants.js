exports.errorMessages = {
  requiredParam: (param) => `Paramater '${param}' should be specified.`,
  requiredQueryParam: (param) => `Query paramater '${param}' should be specified.`,
  postId: (id) => `Post with id: ${id} doesn't exists.`,
  userId: (id) => `User with id: ${id} doesn't exists.`,
  commentId: (id) => `Comment with id: ${id} doesn't exists.`,
  fileFormat: 'Invalid file format.',
  noRights: 'You have no rights to do this',
  invalidFile: 'Invalid file type.',
  userNotFound: 'User not found in database.'
};