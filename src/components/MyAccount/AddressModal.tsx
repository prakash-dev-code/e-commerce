import React, { useEffect, useState } from "react";
import { RxCross2 } from "react-icons/rx";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaEdit,
} from "react-icons/fa";
import { useFormik } from "formik";
import { z } from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { useApi } from "@/services/apiServices";
import { useDispatch } from "react-redux";
import { setLogin } from "@/redux/features/auth-slice";
import { fetchLoggedUserThunk } from "@/redux/features/cart-slice";
const addressSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(10, "Phone number is too short"),
  address: z.string().min(1, "Address is required"),
  email: z.string().email().readonly(), // email won't change
});

const AddressModal = ({ user }: { user: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  // const [savedAddress, setSavedAddress] = useState(user?.addresses);
  const { updateUser } = useApi();
  const dispatch = useDispatch();
  const formik = useFormik({
    initialValues: {
      name: user?.addresses?.name || "",
      email: user?.email || "",
      phone: user?.addresses?.phone || "",
      address: user?.addresses?.address || "",
    },
    enableReinitialize: true,
    validationSchema: toFormikValidationSchema(addressSchema),

    onSubmit: async (values) => {
      try {
        await updateUser(user._id, { addresses: values });
        dispatch(fetchLoggedUserThunk() as any);
        closeModal();
      } catch (error) {
        console.error("Update failed", error);
      }
    },
  });

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (!event.target.closest(".modal-content")) {
        closeModal();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const openAddressModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <>
      <div className="xl:max-w-[370px] w-full bg-white shadow-1 rounded-xl">
        <div className="flex items-center justify-between py-5 px-4 sm:pl-7.5 sm:pr-6 border-b border-gray-3">
          <p className="font-medium text-xl text-dark">Shipping Address</p>
          <button
            className="text-dark hover:text-blue"
            onClick={openAddressModal}
          >
            <FaEdit size={20} />
          </button>
        </div>

        <div className="p-4 sm:p-7.5">
          <div className="flex flex-col gap-4 text-custom-sm">
            <p className="flex items-center gap-2.5">
              <FaUser />
              Name: {formik.values.name}
            </p>
            <p className="flex items-center gap-2.5">
              <FaEnvelope />
              Email: {user?.email}
            </p>
            <p className="flex items-center gap-2.5">
              <FaPhone />
              Phone: {formik.values.phone}
            </p>
            <p className="flex items-start gap-2.5">
              <FaMapMarkerAlt className="mt-0.5" />
              Address: {formik.values.address}
            </p>
          </div>
        </div>
      </div>

      <div
        className={`fixed top-0 left-0 w-full h-screen bg-dark/70 sm:px-8 px-4 py-5 ${
          isOpen ? "block z-99999" : "hidden"
        }`}
      >
        <div className="flex items-center justify-center h-full sm:py-20">
          <div className="w-full max-w-[1100px] rounded-xl shadow-3 bg-white p-7.5 relative modal-content">
            <button
              onClick={closeModal}
              aria-label="button for close modal"
              className="absolute top-3 right-3 w-10 h-10 rounded-full bg-meta text-body hover:text-dark"
            >
              <RxCross2 />
            </button>

            <form onSubmit={formik.handleSubmit}>
              <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
                <div className="w-full">
                  <label htmlFor="name" className="block mb-2.5">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    onChange={formik.handleChange}
                    value={formik.values.name}
                    className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5"
                  />
                  {formik.touched.name && formik.errors.name && (
                    <p className="text-red-500 text-sm">
                      {formik.errors.name as string}
                    </p>
                  )}
                </div>

                <div className="w-full">
                  <label htmlFor="email" className="block mb-2.5">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formik.values.email}
                    readOnly
                    className="rounded-md border border-gray-3 bg-gray-100 text-dark-5 w-full py-2.5 px-5"
                  />
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
                <div className="w-full">
                  <label htmlFor="phone" className="block mb-2.5">
                    Phone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    onChange={formik.handleChange}
                    value={formik.values.phone}
                    className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5"
                  />
                  {formik.touched.phone && formik.errors.phone && (
                    <p className="text-red-500 text-sm">
                      {formik.errors.phone as string}
                    </p>
                  )}
                </div>

                <div className="w-full">
                  <label htmlFor="address" className="block mb-2.5">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    onChange={formik.handleChange}
                    value={formik.values.address}
                    className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5"
                  />
                  {formik.touched.address && formik.errors.address && (
                    <p className="text-red-500 text-sm">
                      {formik.errors.address as string}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md hover:bg-blue-dark"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddressModal;
