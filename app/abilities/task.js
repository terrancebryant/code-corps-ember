import Ember from 'ember';
import { Ability } from 'ember-can';

const {
  computed,
  computed: { alias, equal, or },
  get,
  inject: { service },
  isEmpty
} = Ember;

export default Ability.extend({
  currentUser: service(),

  task: alias('model'),

  userIsAuthor: computed('task.user.id', 'currentUser.user.id', function() {
    let taskUserId = this.get('task.user.id');
    let currentUserId = this.get('currentUser.user.id');

    if (isEmpty(currentUserId)) {
      return false;
    } else {
      return taskUserId === currentUserId;
    }
  }),

  // TODO: Similar code is defined in
  // - `components/project-header.js`
  // - `abilities/project.js`
  projectMembership: computed('task.project.projectUsers', 'currentUser.user.id', function() {
    let currentUserId = get(this, 'currentUser.user.id');

    if (isEmpty(currentUserId)) {
      return false;
    } else {
      return get(this, 'task.project.projectUsers').find((item) => {
        return get(item, 'user.id') === currentUserId;
      });
    }
  }),

  userRole: alias('projectMembership.role'),
  userIsContributor: equal('userRole', 'contributor'),
  userIsAdmin: equal('userRole', 'admin'),
  userIsOwner: equal('userRole', 'owner'),

  //
  // Abilities
  //

  // task authors, admins and owners can edit
  canEdit: or('{userIsAuthor,userIsAdmin,userIsOwner}'),
  // task authors, contributors, admins and owners can assign and reposition
  canAssign: or('canEdit', 'userIsContributor'),
  canReposition: alias('canAssign')
});
