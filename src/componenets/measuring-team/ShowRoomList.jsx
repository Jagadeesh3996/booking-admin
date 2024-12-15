import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { getShowrooms, addShowroom, editShowroom, deleteShowroom } from "../../services/api/api";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toolbar } from "primereact/toolbar";
import { Button } from "primereact/button";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { classNames } from "primereact/utils";
import { Dialog } from "primereact/dialog";

const ShowRoomList = () => {
  let emptyProduct = {
    id: null,
    showroom_name: "",
  };

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

  //   get showrooms data
  useEffect(() => {    
    if (!productDialog) {
      getShowrooms()
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

  // add and edit Item
  const addItem = async () => {
    setSubmitted(true);
    let showroom_name = product.showroom_name.trim();

    const exist = products.find((item) => {
      if (item.id === product.id) {
        return false;
      }
      return item.showroom_name.toLowerCase() === showroom_name.toLowerCase() ;
    });
    if (!showroom_name) {
      return;
    }
    if (exist) {
      toast.warning("Show Room Already Exist !", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    if (showroom_name) {
      let _products = [...products];
      setloading(true);
      if (product.id) {
        const index = products.findIndex((item) => item.id === product.id);
        console.log(product);
        
        const response = await editShowroom(product);
        if (response.status) {
            _products[index] = product;
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
        const response = await addShowroom(product);
        if (response.status) {
            _products.push(product);
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
    const columnsToRemove = ["id"]; // Specify the columns you want to remove
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
    link.download = "showroom_data.csv";
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
      <h4 className="m-0">Show Rooms</h4>
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
    const response = await deleteShowroom(product.id);
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
        const response = await deleteShowroom(item.id);
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
      toast.success("Showrooms Deleted", { position: "top-right", autoClose: 3000 });
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
          <Column
            selectionMode="multiple"
            exportable={false}
            style={{ width: "30px" }}
          />
          <Column header="S.No" body={getSerialNo} style={{ width: "30px" }} />
          <Column field="showroom_name" sortable header="Showroom Name" />
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
        header="Showroom Details"
        footer={productDialogFooter}
        onHide={hideDialog}
      >
        <div className="field">
          <label htmlFor="showroom_name" className="font-bold">
            showroom Name *
          </label>
          <InputText
            id="showroom_name"
            value={product.showroom_name}
            onChange={(e) => onInputChange(e, "showroom_name")}
            required
            className={classNames({
              "p-invalid": submitted && !product.showroom_name,
            })}
          />
          {submitted && !product.showroom_name.trim() && (
            <small className="p-error">Showroom Name is required.</small>
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
              Are you sure you want to delete <b>{product.showroom_name}</b> ?
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

export default ShowRoomList;
