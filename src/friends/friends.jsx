import React from 'react';
import { NavLink } from 'react-router-dom';
import './friends.css';

export function Friends() {
  return (
    <main className="container">
        <table className="friends-table">
            <tbody>
                <tr>
                    <td><span className="status-circle star"></span></td>
                    <td><NavLink to="friend_info">Brighton</NavLink></td>
                </tr>
                <tr>
                    <td><span className="status-circle progressing"></span></td>
                    <td><NavLink to="friend_info">Olivia</NavLink></td>
                </tr>
                <tr>
                    <td><span className="status-circle progressing"></span></td>
                    <td><NavLink to="friend_info">Emma</NavLink></td>
                </tr>
                <tr>
                    <td><span className="status-circle interested"></span></td>
                    <td><NavLink to="friend_info">Isabela</NavLink></td>
                </tr>
            </tbody>
        </table>
        <div className="add-friend-wrapper">
          <button className="btn btn-primary">Add Friend</button>
        </div>
    </main>
  );
}