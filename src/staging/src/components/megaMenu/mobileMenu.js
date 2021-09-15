import React, { useState } from "react"
import PropTypes from "prop-types"
import { Link } from "gatsby"
import BCParksLogo from "../../images/bcparks-h-rgb-rev.png"

const MobileMenu = ({ linkStructure }) => {
  let navigationStack = []

  const updateMenuList = (menu, direction = 'forward') => {
    let backMenuId = 0
    const rootMenuId = linkStructure.find(ls => ls.title === 'Home').strapiId || 0
    if (direction === 'forward') {
      navigationStack.push(menu.strapiId ?? menu.id)
      backMenuId = navigationStack[navigationStack.length - 1] ?? 0
    } else {
      backMenuId = navigationStack[navigationStack.length - 1] ?? 0
      navigationStack = navigationStack.slice(0, -1)
    }
    const parentMenuId = linkStructure.find(ls => ls?.strapiId === (backMenuId ?? menu.id))?.strapiParent?.id
    const parentMenu = linkStructure.find(ls => ls?.strapiId === parentMenuId)
    const targetMenu = direction === 'forward'
      ? linkStructure.filter(ls => ls?.strapiParent?.id === (parseInt(menu.id) ? menu.id : parseInt(menu?.id?.replace('Menus_', ''))))
      : parentMenu
    const targetIsRoot = Array.isArray(targetMenu) 
      ? targetMenu.some(pm => pm?.parent === rootMenuId)
      : targetMenu?.strapiChildren?.some(pm => pm?.parent === rootMenuId)
    
    setActiveList(
      <ul className={`mr-auto list-${direction}`} id="link-list">
        {targetIsRoot &&
          <li key="Home" className={`nav-item`}>
            <Link className={`nav-link`} to="/">Home</Link>
          </li>
        }
        {!targetIsRoot && parentMenu?.strapiChildren?.length && 
          <>
            <li key="back" className="nav-item" onClick={() => updateMenuList(parentMenu?.strapiChildren, 'back')}>
              <i className="fa fa-chevron-left float-left nav-link" />
              <span className={`nav-link`}> Back</span>
            </li>
            <li key={`${menu.title}-header`} className="nav-header">
              <Link className="nav-link" to={direction === 'forward' ? menu?.url ?? '/' : parentMenu?.url ?? '/' }>{direction === 'forward' ? menu.title : parentMenu.title}</Link>
            </li>
          </>
        }
        {sortMenu(targetMenu, direction).map(fm => {
          const children = direction === 'forward' 
            ? fm?.strapiChildren
            : linkStructure.find(ls => ls?.strapiId === fm.id)
          const hasChildren = direction === 'forward' ? children?.length : children?.strapiChildren?.length
          const listProps = {
            key: fm.title,
            className: `nav-item`,
            ...(hasChildren && { onClick: () => updateMenuList(fm) })
          }
          return (
            <li {...listProps}>
              {hasChildren
                ? <span className={`nav-link`}>{fm.title} <i className="fa fa-chevron-right float-right" /></span>
                : <Link className={`nav-link`} to={fm.url}>{fm.title}</Link>
              }
            </li>
          )
        })}
        {targetIsRoot &&
          <li className={`text-center nav-item book-campsite-item`}>
            <a href="https://www.discovercamping.ca" rel="noopener noreferrer nofollow" target="_blank">
              <button type="button" className={`btn px-4 py-3`} id="book-campsite">Book a campsite</button>
            </a>
          </li>
        }
      </ul>
    )
  }
  const [activeList, setActiveList] = useState(state => {
    return (
      <ul className="mr-auto">
        <li key="Home" className={`nav-item`}>
          <Link className={`nav-link`} to="/">Home</Link>
        </li>
        {linkStructure.filter(ls => ls?.strapiParent?.title === 'Home').map(fls => {
          const hasChildren = fls?.strapiChildren?.length
          const listProps = {
            key: fls.title,
            className: `nav-item`,
            ...(hasChildren && { onClick: () => updateMenuList(fls) })
          }
          return (
            <li {...listProps}>
              {hasChildren
                ? <span className={`nav-link`}>{fls.title} <i className="fa fa-chevron-right float-right" /></span>
                : <Link className={`nav-link`} to={fls.url}>{fls.title}</Link>
              }
            </li>
          )
        })}
        <li className={`text-center nav-item book-campsite-item`}>
          <a href="https://www.discovercamping.ca" rel="noopener noreferrer nofollow" target="_blank">
            <button type="button" className={`btn px-4 py-3`} id="book-campsite">Book a campsite</button>
          </a>
        </li>
      </ul>
    )
  })

  return (
    <nav className={`navbar navbar-dark navbar-expand-lg p-0`} id="mainNav">
      <div className={`nav-wrapper d-flex`}>
        <a className="navbar-brand" href="/">
          <img src={BCParksLogo} className="logo" alt="BC Parks logo" />
        </a>
        <button
          className={`navbar-toggler border-0 float-right collapsed`}
          type="button"
          data-toggle="collapse"
          data-target="#menuContent"
          aria-controls="menuContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
          <div class="close-icon py-1">✖</div>
        </button>
      </div>

      <div className={`collapse navbar-collapse`} id="menuContent">
        {activeList}
      </div>
    </nav>
  )
}

const sortMenu = (menu, direction) => {
  if (direction === 'back') {
    return menu?.strapiChildren?.sort((a, b) => a.order - b.order)  
  }
  return menu?.sort((a, b) => a.order - b.order)
}

MobileMenu.propTypes = {
  linkStructure: PropTypes.arrayOf(PropTypes.shape({
    order: PropTypes.number.isRequired,
    pageType: PropTypes.string.isRequired,
    strapiChildren: PropTypes.array.isRequired,
    strapiParent: PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired
    }),
    title: PropTypes.string.isRequired,
    url: PropTypes.string
  }))
}

export default MobileMenu