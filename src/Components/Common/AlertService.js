import Swal from 'sweetalert2';

const commonOptions = {
  target: document.body, // force rendering in global body
  backdrop: true,
  allowOutsideClick: false,
  allowEscapeKey: true,
  customClass: {
    popup: 'swal2-zindex'
  },
  didOpen: (popup) => {
    popup.style.zIndex = '5000'; // very high to override any MUI Dialog
    const backdrop = document.querySelector('.swal2-backdrop');
    if (backdrop) {
      backdrop.style.zIndex = '4999';
    }
  }
};

const AlertService = {
  success: (message) => {
    Swal.fire({
      ...commonOptions,
      icon: 'success',
      title: 'Success!',
      text: message,
      confirmButtonColor: '#3085d6',
    });
  },

  error: (message) => {
    Swal.fire({
      ...commonOptions,
      icon: 'error',
      title: 'Error!',
      text: message,
      confirmButtonColor: '#d33',
    });
  },

  confirm: async (message) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: message,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes!',
      cancelButtonText: 'No',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      backdrop: true,
      target: document.body,
      customClass: { popup: 'swal2-zindex' },
      didOpen: (popup) => {
        popup.style.zIndex = '5000';
        const backdrop = document.querySelector('.swal2-backdrop');
        if (backdrop) backdrop.style.zIndex = '4999';
      }
    });
    return result.isConfirmed;
  },
};

export default AlertService;
