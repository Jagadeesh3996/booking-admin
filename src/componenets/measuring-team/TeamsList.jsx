import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { getShowrooms, getTeams, addTeam, editTeam, deleteTeam} from "../../services/api/api";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toolbar } from "primereact/toolbar";
import { Button } from "primereact/button";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { classNames } from "primereact/utils";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";

// import "primereact/resources/themes/mdc-dark-indigo/theme.css";
// import 'primereact/resources/themes/mira/theme.css';
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

const TeamsList = () => {
  let emptyProduct = {
    id: null,
    team_name : "",
    sr_id : "",
    team_manager_mail : "",
    team_manager_password : "",
    team_member_mail : "",
    team_member_password : "",
  };

  const theme = useSelector((state) => state.theme.value);
  const [themeName, setthemeName] = useState(
    theme === "dark" ? "mdc-dark-indigo" : "mira"
  );
  const [showrooms, setShowrooms] = useState([]);
  const [products, setProducts] = useState();
  const [globalFilter, setGlobalFilter] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState(null);
  const [product, setProduct] = useState(emptyProduct);
  const [productDialog, setProductDialog] = useState(false);
  const [deleteProductDialog, setDeleteProductDialog] = useState(false);
  const [deleteProductsDialog, setDeleteProductsDialog] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setloading] = useState(false);
  const dt = useRef(null);  

  // theme change
  useEffect(() => {
    setthemeName(theme === "dark" ? "mdc-dark-indigo" : "mira");
  }, [theme]);
  useEffect(() => {
    const existingTheme = document.getElementById("theme-style");
    if (existingTheme) {
      existingTheme.remove();
    }
    const link = document.createElement("link");
    link.id = "theme-style";
    link.rel = "stylesheet";
    link.href = `https://unpkg.com/primereact/resources/themes/${themeName}/theme.css`;
    document.head.appendChild(link);
  }, [themeName]);

  //   get showrooms and teams data
  useEffect(() => {
    if (!productDialog) {
      getShowrooms()
        .then((response) => {
          if (response.status) {
            let showroomlist = response.data.map((item)=>{
              return {value: item.id, label: item.showroom_name};
            })
            setShowrooms(showroomlist);
          }
        });
      getTeams()
        .then((response) => {
          if (response.status) {
            setProducts(response.data);
          } else {
            setProducts([]);
            toast.warning("No Data to Show !", {
              position: "top-right",
              autoClose: 3000,
            });
          }
        })
        .catch((error) => {
          setProducts([]);
          console.error(error);
        });
    }
  }, [productDialog]);

  // open add popup
  const openNew = () => {
    setProduct(emptyProduct);
    setSubmitted(false);
    setProductDialog(true);
  };

  // hide popup
  const hideDialog = () => {
    setSubmitted(false);
    setProductDialog(false);
  };

  //open edit popup
  const editProduct = (product) => {
    setProduct({ ...product });
    setProductDialog(true);
  };

  // input
  const onInputChange = (e, name) => {
    const val = (e.target && e.target.value) || "";
    let _product = { ...product };
    _product[`${name}`] = val.trimStart();
    setProduct(_product);
  };

  // check email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email validation regex
    return emailRegex.test(email);
  };

  // trim white space in object
  const trimObjectValues = (obj) => {
    const trimmedObject = {};
    for (const key in obj) {
      (typeof obj[key] === "string") ? trimmedObject[key] = obj[key].trim() : trimmedObject[key] = obj[key];
    }
    return trimmedObject;
  };

  // add and edit Item
  const addItem = async () => {
    setSubmitted(true);
    let _product = trimObjectValues(product);
    if (!_product.id && !_product.sr_id || !_product.team_name || !_product.team_manager_mail || !_product.team_manager_password || !_product.team_member_mail || !_product.team_member_password) {
      return;
    }
    const name = products.find((item) => {
      if (item.id === _product.id) {
        return false;
      }
      return (item.team_name.toLowerCase() === _product.team_name.toLowerCase());
    });    
    if (name) {
      toast.warning("Team Name Already Exist !", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    if (!validateEmail(_product.team_manager_mail)) {
      toast.warning("Invalid Manager Mail !", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    if (!validateEmail(_product.team_member_mail)) {
      toast.warning("Invalid Member Mail !", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    const exist = products.find((item) => {
      if (item.id === _product.id) {
        return false;
      }
      return (item.team_manager_mail.toLowerCase() === _product.team_manager_mail.toLowerCase() || item.team_member_mail.toLowerCase() === _product.team_manager_mail.toLowerCase());
    });    
    if (exist) {
      toast.warning("Manager Mail Already Exist !", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    const exist2 = products.find((item) => {
      if (item.id === _product.id) {
        return false;
      }
      return (item.team_manager_mail.toLowerCase() === _product.team_member_mail.toLowerCase() || item.team_member_mail.toLowerCase() === _product.team_member_mail.toLowerCase());
    });
    if (exist2) {
      toast.warning("Member Mail Already Exist !", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    if (_product.team_manager_mail === _product.team_member_mail) {
      toast.warning("Both mails cannot be same !", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    // add and edit api
    if (_product.team_name) {
      let _products = [...products];
      setloading(true);
      if (_product.id) {        
        const index = products.findIndex((item) => item.id === _product.id);
        const response = await editTeam(_product);
        if (response.status) {
            _products[index] = _product;
            toast.success(response.message, {
                position: "top-right",
                autoClose: 3000,
            });
        } else {
            toast.warning(response.message, {
                position: "top-right",
                autoClose: 3000,
            });
        }
      } else {
        const response = await addTeam(_product);
        if (response.status) {
            _products.push(_product);
            toast.success(response.message, {
                position: "top-right",
                autoClose: 3000,
            });
        } else {
            toast.warning(response.message, {
                position: "top-right",
                autoClose: 3000,
            });
        }
      }
      setSubmitted(false);
      setloading(false);
      setProducts(_products);
      setProductDialog(false);
      setProduct(emptyProduct);
    }
  };

  // delete one product
  const confirmDeleteProduct = (product) => {
    setProduct(product);
    setDeleteProductDialog(true);
  };

  // save and cancel button
  const productDialogFooter = (
    <React.Fragment>
      <Button
        label="Cancel"
        icon="pi pi-times"
        className="me-2"
        outlined
        onClick={hideDialog}
      />
      <Button 
        label="Save" 
        icon="pi pi-check" 
        disabled={loading}
        onClick={addItem} 
      />
    </React.Fragment>
  );

  // Custom CSV Export Function
  const exportCustomCSV = (data) => {
    const columnsToRemove = ["id", "sr_id"]; // Specify the columns you want to remove
    const headers = Object.keys(data[0]).filter(
      (header) => !columnsToRemove.includes(header)
    );
    const csvRows = [];
    csvRows.push(headers.join(","));
    data.forEach((row) => {
      csvRows.push(headers.map((field) => row[field]).join(","));
    });
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "team_data.csv";
    link.click();
  };
  const exportCSV = () => {
    let item = dt.current.props.value;
    let modifiedData = [];
    item.forEach((row, index) => {
      modifiedData.push({
        "s.no": index + 1,
        ...row,
      });
    });
    exportCustomCSV(modifiedData);
  };

  // add and delete button
  const leftToolbarTemplate = () => {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          label="New"
          icon="pi pi-plus"
          severity="success"
          onClick={openNew}
        />
        <Button
          label="Delete"
          icon="pi pi-trash"
          severity="danger"
          onClick={() => setDeleteProductsDialog(true)}
          disabled={!selectedProducts || !selectedProducts.length}
        />
      </div>
    );
  };

  // export button
  const rightToolbarTemplate = () => {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          label="Export"
          icon="pi pi-upload"
          className="p-button-help"
          disabled={(!products || products.length == 0 ) ? true : false}
          onClick={exportCSV}
        />
      </div>
    );
  };

  // table headre
  const header = (
    <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
      <h4 className="m-0">Teams</h4>
      <IconField iconPosition="left">
        <InputIcon className="pi pi-search" />
        <InputText
          type="search"
          onInput={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search..."
        />
      </IconField>
    </div>
  );

  // edit and delete button
  const actionBodyTemplate = (rowData) => {
    return (
      <React.Fragment>
        <div className="flex">
          <Button
            icon="pi pi-pencil"
            outlined
            className="me-2 rounded-circle a-btn"
            onClick={() => editProduct(rowData)}
          />
          <Button
            icon="pi pi-trash"
            outlined
            severity="danger"
            className="rounded-circle a-btn"
            onClick={() => confirmDeleteProduct(rowData)}
          />
        </div>
      </React.Fragment>
    );
  };

  // delete one
  const deleteProduct = async () => {
    setloading(true);
    const response = await deleteTeam(product.id);    
    if (response.status) {
        let _products = products.filter((val) => val.id !== product.id);
        setProducts(_products);
        setDeleteProductDialog(false);
        setProduct(emptyProduct);    
        toast.success(response.message, {
            position: "top-right",
            autoClose: 3000,
        });
    } else {
        toast.warning(response.message, {
            position: "top-right",
            autoClose: 3000,
        });
    }
    setloading(false);
  };
  const deleteProductDialogFooter = (
    <React.Fragment>
      <Button
        label="No"
        icon="pi pi-times"
        className="me-2"
        outlined
        onClick={() => setDeleteProductDialog(false)}
      />
      <Button
        label="Yes"
        icon="pi pi-check"
        severity="danger"
        disabled={loading}
        onClick={deleteProduct}
      />
    </React.Fragment>
  );

  // delete many
  const deleteSelectedProducts = () => {
    setloading(true);
    let _products1 =  [...products];
    const deletePromises = selectedProducts.map(async (item)=>{
        const response = await deleteTeam(item.id);
        if (response.status) {
            let _products2 = _products1.filter((val) => val.id !== item.id);
            _products1 = [..._products2];
        } else {
            toast.warning(response.message, {
                position: "top-right",
                autoClose: 3000,
            });    
        }
    });
    Promise.all(deletePromises).then (()=>{
      setProducts(_products1);
      setDeleteProductsDialog(false);
      setSelectedProducts(null);
      toast.success("Teams Deleted", { position: "top-right", autoClose: 3000 });
    });
    setloading(false);
  };
  const deleteProductsDialogFooter = (
    <React.Fragment>
      <Button
        label="No"
        icon="pi pi-times"
        className="me-2"
        outlined
        onClick={() => setDeleteProductsDialog(false)}
      />
      <Button
        label="Yes"
        icon="pi pi-check"
        severity="danger"
        disabled={loading}
        onClick={deleteSelectedProducts}
      />
    </React.Fragment>
  );

  // Function to get S.No
  const getSerialNo = (rowData, index) => index.rowIndex + 1;

  return (
    <>
      <ToastContainer />
      <div className="card">
        <Toolbar
          className="mb-4"
          start={rightToolbarTemplate}
          end={leftToolbarTemplate}
        ></Toolbar>

        {/* table */}
        <DataTable
          ref={dt}
          value={products}
          paginator
          rows={10}
          className="datatable"
          rowsPerPageOptions={[5, 10, 15]}
          globalFilter={globalFilter}
          header={header}
          selection={selectedProducts}
          onSelectionChange={(e) => setSelectedProducts(e.value)}
          selectionMode="checkbox"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
        >
          <Column selectionMode="multiple" exportable={false} style={{ width: "30px" }} />
          <Column header="S.No" body={getSerialNo} style={{ width: "30px" }} />
          <Column field="showroom_name" sortable header="Show Room Name" />
          <Column field="team_name" sortable header="Team Name" />
          <Column field="team_manager_mail" sortable header="Manager Mail" />
          <Column field="team_manager_password" header="Manager Password" />
          <Column field="team_member_mail" sortable header="Member Mail" />
          <Column field="team_member_password" header="Member Password" />
          <Column
            header="Action"
            body={actionBodyTemplate}
            exportable={false}
            style={{ width: "50px" }}
          />
        </DataTable>
      </div>

      {/* add and edit product dialog */}
      <Dialog
        visible={productDialog}
        style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        modal
        className="p-fluid"
        header="Team Details"
        footer={productDialogFooter}
        onHide={hideDialog}
      >
        <div className="field">
          <label htmlFor="sr_id">Showroom Name *</label>
          <Dropdown
            id="sr_id"
            value={product.sr_id}
            options={showrooms}
            onChange={(e) => onInputChange(e, "sr_id")}
            placeholder="Select a Showroom"
            required
            className={classNames({
              "p-invalid": submitted && !product.sr_id,
            })}
          />
          {submitted && !product.sr_id && (
            <small className="p-error">Showroom Name is required.</small>
          )}
        </div>
        <div className="field mb-3">
          <label htmlFor="team_name" className="font-bold">
            Team Name *
          </label>
          <InputText
            id="team_name"
            value={product.team_name}
            onChange={(e) => onInputChange(e, "team_name")}
            required
            className={classNames({
              "p-invalid": submitted && !product.team_name,
            })}
          />
          {submitted && !product.team_name.trim() && (
            <small className="p-error">Team Name is required.</small>
          )}
        </div>
        <div className="field mb-3">
          <label htmlFor="team_manager_mail" className="font-bold">
            Manager Mail *
          </label>
          <InputText
            id="nteam_manager_mailame"
            value={product.team_manager_mail}
            onChange={(e) => onInputChange(e, "team_manager_mail")}
            required
            className={classNames({
              "p-invalid": submitted && !product.team_manager_mail,
            })}
          />
          {submitted && !product.team_manager_mail.trim() && (
            <small className="p-error">Manager Mail is required.</small>
          )}
        </div>
        <div className="field mb-3">
          <label htmlFor="team_manager_password" className="font-bold">
            Manager Password *
          </label>
          <InputText
            id="team_manager_password"
            value={product.team_manager_password}
            onChange={(e) => onInputChange(e, "team_manager_password")}
            required
            className={classNames({
              "p-invalid": submitted && !product.team_manager_password,
            })}
          />
          {submitted && !product.team_manager_password.trim() && (
            <small className="p-error">Manager Password is required.</small>
          )}
        </div>
        <div className="field mb-3">
          <label htmlFor="team_member_mail" className="font-bold">
            Member Mail *
          </label>
          <InputText
            id="team_member_mail"
            value={product.team_member_mail}
            onChange={(e) => onInputChange(e, "team_member_mail")}
            required
            className={classNames({
              "p-invalid": submitted && !product.team_member_mail,
            })}
          />
          {submitted && !product.team_member_mail.trim() && (
            <small className="p-error">Member Mail is required.</small>
          )}
        </div>
        <div className="field mb-3">
          <label htmlFor="team_member_password" className="font-bold">
            Member Password *
          </label>
          <InputText
            id="team_member_password"
            value={product.team_member_password}
            onChange={(e) => onInputChange(e, "team_member_password")}
            required
            className={classNames({
              "p-invalid": submitted && !product.team_member_password,
            })}
          />
          {submitted && !product.team_member_password.trim() && (
            <small className="p-error">Member Password is required.</small>
          )}
        </div>
      </Dialog>

      {/* delete single product dialog */}
      <Dialog
        visible={deleteProductDialog}
        style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header="Confirm"
        modal
        footer={deleteProductDialogFooter}
        onHide={() => setDeleteProductDialog(false)}
      >
        <div>
          <i
            className="pi pi-exclamation-triangle me-3"
            style={{ fontSize: "2rem" }}
          />
          {product && (
            <span>
              Are you sure you want to delete <b>{product.name}</b> ?
            </span>
          )}
        </div>
      </Dialog>

      {/* delete many products dialog */}
      <Dialog
        visible={deleteProductsDialog}
        style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header="Confirm"
        modal
        footer={deleteProductsDialogFooter}
        onHide={() => setDeleteProductsDialog(false)}
      >
        <div>
          <i
            className="pi pi-exclamation-triangle me-3"
            style={{ fontSize: "2rem" }}
          />
          {product && (
            <span>Are you sure you want to delete the selected Items ?</span>
          )}
        </div>
      </Dialog>
    </>
  );
};

export default TeamsList;
