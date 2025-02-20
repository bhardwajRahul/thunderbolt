use std::env;

pub fn fetch_inbox_top() -> imap::error::Result<Option<String>> {
    // Try to load from .env if present, continue if not found
    if let Ok(path) = env::var("CARGO_MANIFEST_DIR") {
        let env_path = std::path::Path::new(&path).join(".env");
        if env_path.exists() {
            dotenv::from_path(env_path).ok();
        }
    }

    let domain = env::var("IMAP_DOMAIN").expect("IMAP_DOMAIN environment variable must be set");
    let username =
        env::var("IMAP_USERNAME").expect("IMAP_USERNAME environment variable must be set");
    let password =
        env::var("IMAP_PASSWORD").expect("IMAP_PASSWORD environment variable must be set");
    let port = env::var("IMAP_PORT")
        .expect("IMAP_PORT environment variable must be set")
        .parse::<u16>()
        .expect("IMAP_PORT must be a valid port number");

    let tls = native_tls::TlsConnector::builder()
        .danger_accept_invalid_certs(true)
        .build()
        .unwrap();

    // we pass in the domain twice to check that the server's TLS
    // certificate is valid for the domain we're connecting to.
    let client = imap::connect_starttls((&*domain, port), &domain, &tls).unwrap();

    // the client we have here is unauthenticated.
    // to do anything useful with the e-mails, we need to log in
    let mut imap_session = client.login(&username, &password).map_err(|e| e.0)?;

    imap_session.debug = true;

    // we want to fetch the first email in the INBOX mailbox
    imap_session.select("INBOX")?;

    // fetch message number 1 in this mailbox, along with its RFC822 field.
    // RFC 822 dictates the format of the body of e-mails
    // let messages = imap_session.fetch("1", "RFC822")?;
    let messages = imap_session.fetch("1", "BODY[TEXT]")?;

    let message = if let Some(m) = messages.iter().next() {
        m
    } else {
        return Ok(None);
    };

    // extract the message's body
    let body = message.body().expect("message did not have a body!");
    let body = std::str::from_utf8(body)
        .expect("message was not valid utf-8")
        .to_string();

    // be nice to the server and log out
    imap_session.logout()?;

    Ok(Some(body))
}
