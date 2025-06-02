// import { Navigate, Outlet, useLocation } from 'react-router-dom';
// import { useContext } from 'react';
// import { AuthContext } from '@contexts/AuthContext';

// const PrivateRoute = ({ roles = [], ...rest }) => {
//   const { isAuthenticated, user } = useContext(AuthContext);
//   const location = useLocation();

//   if (!isAuthenticated) {
//     return (
//       <Navigate
//         to="/access-denied"
//         state={{
//           from: location.pathname,
//           error: 'Please log in to access this page.',
//           isAuthenticated: false,
//         }}
//         replace
//       />
//     );
//   }

//   // Commented-out admin role check (for future use)
//   /*
//   if (roles.length > 0 && (!user?.role || !roles.includes(user.role))) {
//     return (
//       <Navigate
//         to="/access-denied"
//         state={{
//           from: location.pathname,
//           error: 'You do not have the required permissions to access this page.',
//           isAuthenticated: true,
//         }}
//         replace
//       />
//     );
//   }
//   */

//   return <Outlet {...rest} key={location.pathname} />;
// };

// export default PrivateRoute;