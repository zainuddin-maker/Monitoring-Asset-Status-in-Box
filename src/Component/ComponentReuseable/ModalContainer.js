// System library imports
import React from "react";
import ReactDOM from "react-dom";

// Custom library imports
import ButtonSubmit from "./ButtonSubmit";
import ButtonClear from "./ButtonClear";
import ButtonExit from "./ButtonExit";

// Style imports
import "./style.scss";

const ModalContainer = (props) => {
    let {
        children,
        width,
        level,
        isShowing,
        hide,
        title,
        formId,
        submitName,
        onSubmit,
        clearName,
        onClear,
        isLoading,
        isDisabled,
        isLoadingClear,
        isDisabledClear,
        showRequired,
    } = props;

    return isShowing
        ? ReactDOM.createPortal(
              <React.Fragment>
                  <div
                      className='reusable-modal-overlay'
                      style={level ? { zIndex: `${1020 + 20 * level}` } : {}}
                  />
                  <div
                      className='reusable-modal-wrapper'
                      style={
                          level ? { zIndex: `${1020 + 20 * level + 10}` } : {}
                      }>
                      <div
                          style={{
                              position: "absolute",
                              height: "100%",
                              width: "100%",
                          }}
                          onClick={hide}
                      />
                      <div
                          className='reusable-modal'
                          style={level ? { zIndex: `${99 + level}` } : {}}>
                          <div className='reusable-modal__title'>
                              <span>{title}</span>
                              <ButtonExit hide={hide} />
                          </div>
                          <div
                              className='reusable-modal__content'
                              style={width ? { width: width } : {}}>
                              {children}
                              {showRequired ? (
                                  <div className='reusable-modal__content__required-legend'>
                                      *Required
                                  </div>
                              ) : null}
                          </div>
                          {(submitName !== undefined ||
                              clearName !== undefined) && (
                              <div className='reusable-modal__button-container'>
                                  {submitName !== undefined &&
                                  (formId !== undefined ||
                                      onSubmit !== undefined) ? (
                                      <ButtonSubmit
                                          name={submitName}
                                          formId={formId}
                                          onSubmit={onSubmit}
                                          isLoading={isLoading}
                                          isDisabled={
                                              isDisabled || isLoadingClear
                                          }
                                      />
                                  ) : null}
                                  {clearName !== undefined &&
                                  onClear !== undefined ? (
                                      <ButtonClear
                                          name={clearName}
                                          onClear={onClear}
                                          isLoading={isLoadingClear}
                                          isDisabled={
                                              isDisabledClear || isLoading
                                          }
                                      />
                                  ) : null}
                              </div>
                          )}
                      </div>
                  </div>
              </React.Fragment>,
              document.body
          )
        : null;
};

export default ModalContainer;
