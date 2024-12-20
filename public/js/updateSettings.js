/* eslint-disable */
import axios from "axios";
import { showAlert } from "./alerts";

// type is either "password" or "data"
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === "password"
        ? "/api/v1/users/updateMyPassword"
        : "/api/v1/users/updateMe";

    const res = await axios({
      method: "PATCH",
      url,
      data,
    });

    console.log(res.data.status);

    if (res.data.status === "success") {
      showAlert(
        "success",
        `${type.toUpperCase()} has been updated successfully`,
      );
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};
