export default function ensureProfilePicture(object, key) {
    if (object[key] == null || object[key] === undefined) object[key] = "/assets/default-profile-picture.jpg";
}