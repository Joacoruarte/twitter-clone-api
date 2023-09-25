class UserDTO {
  constructor({
    user_id,
    user_handle,
    first_name,
    last_name,
    user_picture,
    created_at,
  }) {
    this.user_id = user_id;
    this.user_handle = user_handle;
    this.first_name = first_name;
    this.last_name = last_name;
    this.user_picture = user_picture;
    this.created_at = created_at;
  }
}

export default UserDTO;
