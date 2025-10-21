export default function decorate(block) {
  const root = document.createElement('div');
  root.className = 'my-account';
  block.innerHTML = ' ';
  block.append(root);

  const renderLoggedOut = () => {
    root.innerHTML = `
      <div class="g-btn"></div>
      <div class="hint">Sign in with Google to continue</div>
    `;
    const btn = root.querySelector('.g-btn');
    // enable One-Tap by passing { oneTap: true } if you want it
    window.Auth?.renderButton(btn, { oneTap: false });
  };

  const renderLoggedIn = (u) => {
    root.innerHTML = `
      <div class="account-info">
        <img src="${u.picture}" alt="${u.name}" />
        <div class="who">
          <div class="welcome">Welcome, ${u.name?.split(' ')[0] || u.name}</div>
          <div class="email">${u.email}</div>
        </div>
        <button class="signout">Sign out</button>
      </div>
    `;
    root.querySelector('.signout').addEventListener('click', () => window.Auth.signOut());
  };

  const draw = (user) => (user ? renderLoggedIn(user) : renderLoggedOut());
  draw(window.Auth?.getUser?.() || null);
  window.Auth?.onChange(draw);
}
